  (func (;40951;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i64)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4365075
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365075
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.load offset=8
              br_table 0 (;@5;) 1 (;@4;) 4 (;@1;)
            end
            local.get 0
            i32.load offset=16
            local.set 1
            local.get 0
            i32.const -1
            i32.store offset=8
            local.get 1
            i32.load8_u offset=240
            br_if 3 (;@1;)
            block  ;; label = @5
              local.get 0
              i32.load offset=20
              i32.const 1
              i32.sub
              br_table 0 (;@5;) 3 (;@2;) 4 (;@1;)
            end
            local.get 1
            i32.const 1
            i32.const 0
            call 44407
            i32.eqz
            br_if 1 (;@3;)
            local.get 1
            i32.const 2
            i32.const 0
            call 44431
            local.set 3
            i32.const 3360788
            i32.load
            local.tee 4
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 4
              call 60460
            end
            local.get 3
            i32.const 0
            i32.const 0
            call 48812
            i32.eqz
            br_if 1 (;@3;)
            local.get 1
            local.get 3
            i32.const 2
            i32.const 0
            call 44397
            local.get 2
            i32.const 16
            i32.add
            local.get 3
            i32.const 0
            call 48735
            i32.const 0
            call 49468
            local.get 2
            i64.load offset=16
            local.set 6
            local.get 1
            i32.const 3
            i32.const 2
            i32.const 0
            call 44413
            drop
            local.get 2
            local.get 6
            i64.store
            local.get 2
            local.get 6
            i64.store offset=8
            i32.const 1
            local.set 5
            local.get 1
            local.get 3
            local.get 2
            i32.const 0
            call 44418
            local.set 1
            local.get 0
            i32.const 1
            i32.store offset=8
            local.get 0
            local.get 1
            i32.store offset=12
            br 3 (;@1;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          br 2 (;@1;)
        end
        local.get 1
        i32.const 3
        i32.const 1
        i32.const 0
        call 44413
        drop
        br 1 (;@1;)
      end
      local.get 1
      i32.const 3
      i32.const 2
      i32.const 0
      call 44413
      drop
    end
    local.get 2
    i32.const 32
    i32.add
    global.set 0
    local.get 5)
