  (func (;40917;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 0
    local.set 1
    i32.const 4365064
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3353480
      call 2180
      i32.const 3357576
      call 2180
      i32.const 3383752
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3432320
      call 2180
      i32.const 3365220
      call 2180
      i32.const 4365064
      i32.const 1
      i32.store8
    end
    local.get 5
    i32.const 0
    i32.store offset=12
    local.get 0
    i32.load offset=16
    local.set 2
    block  ;; label = @1
      local.get 0
      block (result i32)  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 0
                i32.load offset=8
                br_table 0 (;@6;) 1 (;@5;) 2 (;@4;) 5 (;@1;)
              end
              local.get 0
              i32.const -1
              i32.store offset=8
              br 2 (;@3;)
            end
            local.get 0
            i32.const -1
            i32.store offset=8
            i32.const 3357576
            i32.load
            local.tee 1
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 1
              call 60460
            end
            i32.const 4367470
            i32.load8_u
            i32.eqz
            if  ;; label = @5
              i32.const 3357576
              call 2180
              i32.const 4367470
              i32.const 1
              i32.store8
            end
            i32.const 3357576
            i32.load
            local.tee 1
            i32.load offset=116
            if (result i32)  ;; label = @5
              local.get 1
            else
              local.get 1
              call 60460
              i32.const 3357576
              i32.load
            end
            i32.load offset=92
            i32.load
            local.set 1
            i32.const 3360788
            i32.load
            local.tee 4
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 4
              call 60460
            end
            local.get 1
            i32.const 0
            i32.const 0
            call 48872
            br_if 1 (;@3;)
            i32.const 3357576
            i32.load
            local.tee 1
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 1
              call 60460
            end
            i32.const 4367470
            i32.load8_u
            i32.eqz
            if  ;; label = @5
              i32.const 3357576
              call 2180
              i32.const 4367470
              i32.const 1
              i32.store8
            end
            i32.const 3357576
            i32.load
            local.tee 1
            i32.load offset=116
            if (result i32)  ;; label = @5
              local.get 1
            else
              local.get 1
              call 60460
              i32.const 3357576
              i32.load
            end
            i32.load offset=92
            i32.load
            i32.load offset=16
            i32.const 1
            i32.ne
            br_if 1 (;@3;)
            local.get 2
            i32.load8_u offset=240
            br_if 1 (;@3;)
            local.get 2
            i32.load offset=192
            br_if 1 (;@3;)
            local.get 2
            i32.load offset=216
            i32.load offset=16
            i32.const 0
            i32.gt_s
            br_if 1 (;@3;)
            local.get 2
            i32.load8_u offset=188
            br_if 1 (;@3;)
            i32.const 0
            local.set 1
            i32.const 0
            call 48615
            local.get 2
            f32.load offset=144
            f32.gt
            br_if 1 (;@3;)
            i32.const 3353480
            i32.load
            i32.const 3
            call 2185
            local.tee 4
            i32.const 3432320
            i32.load
            i32.const 0
            call 52128
            local.get 4
            i32.load offset=12
            local.tee 3
            i32.const 0
            i32.le_s
            br_if 1 (;@3;)
            loop  ;; label = @5
              local.get 2
              local.get 4
              local.get 1
              local.get 3
              i32.rem_s
              i32.const 2
              i32.shl
              i32.add
              i32.load offset=16
              local.tee 6
              i32.const 0
              call 44431
              local.set 3
              i32.const 3360788
              i32.load
              local.tee 7
              i32.load offset=116
              i32.eqz
              if  ;; label = @6
                local.get 7
                call 60460
              end
              block  ;; label = @6
                local.get 3
                i32.const 0
                i32.const 0
                call 48872
                br_if 0 (;@6;)
                local.get 2
                local.get 6
                local.get 5
                i32.const 12
                i32.add
                i32.const 0
                call 44429
                i32.eqz
                br_if 0 (;@6;)
                local.get 2
                local.get 3
                local.get 6
                i32.const 0
                call 44397
                local.get 2
                i32.const 1
                i32.store8 offset=188
                local.get 2
                local.get 3
                local.get 6
                local.get 5
                i32.load offset=12
                i32.const 0
                call 44430
                local.set 2
                i32.const 2
                br 4 (;@2;)
              end
              local.get 1
              i32.const 1
              i32.add
              local.tee 1
              local.get 4
              i32.load offset=12
              local.tee 3
              i32.lt_s
              br_if 0 (;@5;)
            end
            br 1 (;@3;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          local.get 2
          i32.const 0
          i32.store8 offset=188
        end
        local.get 2
        f32.load offset=136
        local.get 2
        f32.load offset=140
        i32.const 0
        call 48613
        local.set 8
        i32.const 3365220
        i32.load
        call 1900
        local.tee 2
        local.get 8
        i32.const 0
        call 2408
        i32.const 1
      end
      i32.store offset=8
      local.get 0
      local.get 2
      i32.store offset=12
      i32.const 1
      local.set 1
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 1)
