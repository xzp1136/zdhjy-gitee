  (func (;41077;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365169
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3375572
      call 2180
      i32.const 3376472
      call 2180
      i32.const 3353480
      call 2180
      i32.const 3357344
      call 2180
      i32.const 3353636
      call 2180
      i32.const 3353180
      call 2180
      i32.const 3387156
      call 2180
      i32.const 3387160
      call 2180
      i32.const 3432328
      call 2180
      i32.const 3365220
      call 2180
      i32.const 4365169
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=20
    local.set 12
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 0
                  i32.load offset=8
                  br_table 0 (;@7;) 1 (;@6;) 2 (;@5;) 6 (;@1;)
                end
                local.get 0
                i32.const -1
                i32.store offset=8
                i32.const 3353480
                i32.load
                i32.const 4
                call 2185
                local.tee 1
                i32.const 3432328
                i32.load
                i32.const 0
                call 52128
                local.get 0
                local.get 1
                i32.store offset=24
                local.get 0
                i32.const 3353180
                i32.load
                local.get 1
                i32.load offset=12
                call 2185
                i32.store offset=28
                local.get 0
                i32.const 3353636
                i32.load
                local.get 0
                i32.load offset=24
                i32.load offset=12
                call 2185
                i32.store offset=32
                i32.const 3365220
                i32.load
                call 1900
                local.tee 1
                f32.const 0x1.99999ap-5 (;=0.05;)
                i32.const 0
                call 2408
                local.get 0
                local.get 1
                i32.store offset=36
                i32.const 3354788
                i32.load
                local.tee 1
                i32.load offset=116
                i32.eqz
                if  ;; label = @7
                  local.get 1
                  call 60460
                end
                i32.const 4367468
                i32.load8_u
                i32.eqz
                if  ;; label = @7
                  i32.const 3354788
                  call 2180
                  i32.const 4367468
                  i32.const 1
                  i32.store8
                end
                local.get 0
                i32.const 24
                i32.add
                local.set 7
                i32.const 3354788
                i32.load
                local.tee 1
                i32.load offset=116
                if (result i32)  ;; label = @7
                  local.get 1
                else
                  local.get 1
                  call 60460
                  i32.const 3354788
                  i32.load
                end
                i32.load offset=92
                i32.load
                local.tee 1
                if  ;; label = @7
                  i32.const 0
                  call 56046
                  i32.load offset=52
                  local.set 2
                  i32.const 3376472
                  i32.load
                  local.set 4
                  local.get 3
                  i32.const 73
                  i32.store offset=12
                  local.get 2
                  local.get 3
                  i32.const 12
                  i32.add
                  local.get 3
                  local.get 4
                  call 34434
                  local.get 1
                  local.get 3
                  i32.load offset=4
                  i32.const 0
                  call 44254
                end
                local.get 7
                i32.load
                local.tee 4
                i32.load offset=12
                i32.const 0
                i32.le_s
                br_if 3 (;@3;)
                i32.const 0
                local.set 1
                loop  ;; label = @7
                  i32.const 3375572
                  i32.load
                  local.set 2
                  local.get 0
                  i32.load offset=16
                  local.set 5
                  local.get 0
                  i32.load offset=28
                  local.set 6
                  local.get 3
                  local.get 4
                  local.get 1
                  i32.const 2
                  i32.shl
                  local.tee 8
                  i32.add
                  i32.load offset=16
                  i32.store
                  local.get 5
                  local.get 3
                  local.get 6
                  local.get 8
                  i32.add
                  i32.const 16
                  i32.add
                  local.get 2
                  call 34286
                  drop
                  local.get 1
                  i32.const 1
                  i32.add
                  local.tee 1
                  local.get 0
                  i32.load offset=24
                  local.tee 4
                  i32.load offset=12
                  local.tee 2
                  i32.lt_s
                  br_if 0 (;@7;)
                end
                br 2 (;@4;)
              end
              local.get 0
              i32.const -1
              i32.store offset=8
              local.get 0
              i32.const 24
              i32.add
              local.set 7
              local.get 0
              i32.load offset=24
              i32.load offset=12
              local.set 2
              br 1 (;@4;)
            end
            local.get 0
            i32.const -1
            i32.store offset=8
            i32.const 3357344
            i32.load
            local.tee 0
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 0
              call 60460
            end
            i32.const 4367474
            i32.load8_u
            i32.eqz
            if  ;; label = @5
              i32.const 3357344
              call 2180
              i32.const 4367474
              i32.const 1
              i32.store8
            end
            i32.const 3357344
            i32.load
            local.tee 0
            i32.load offset=116
            if (result i32)  ;; label = @5
              local.get 0
            else
              local.get 0
              call 60460
              i32.const 3357344
              i32.load
            end
            i32.load offset=92
            i32.load
            local.tee 0
            i32.eqz
            br_if 3 (;@1;)
            local.get 0
            i32.const 0
            call 44408
            br 3 (;@1;)
          end
          local.get 2
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          local.get 0
          i32.load offset=28
          local.set 6
          i32.const 0
          local.set 1
          loop  ;; label = @4
            local.get 6
            local.get 1
            i32.const 2
            i32.shl
            local.tee 4
            i32.add
            i32.load offset=16
            local.tee 5
            if  ;; label = @5
              local.get 0
              i32.load offset=32
              local.get 4
              i32.add
              i32.load offset=16
              local.get 5
              i32.load offset=12
              i32.lt_s
              br_if 3 (;@2;)
            end
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            local.get 2
            i32.ne
            br_if 0 (;@4;)
          end
        end
        i32.const 3365220
        i32.load
        call 1900
        local.tee 1
        f32.const 0x1.666666p-2 (;=0.35;)
        i32.const 0
        call 2408
        local.get 0
        i32.const 2
        i32.store offset=8
        local.get 0
        local.get 1
        i32.store offset=12
        i32.const 1
        local.set 10
        br 1 (;@1;)
      end
      i32.const 1
      local.set 10
      i32.const 3
      i32.const 5
      i32.const 0
      call 48614
      local.set 9
      i32.const 0
      local.get 7
      i32.load
      i32.load offset=12
      i32.const 0
      call 48614
      local.set 8
      block  ;; label = @2
        local.get 9
        i32.const 0
        i32.le_s
        br_if 0 (;@2;)
        local.get 7
        i32.load
        local.set 6
        i32.const 0
        local.set 5
        loop  ;; label = @3
          local.get 6
          i32.load offset=12
          local.tee 2
          i32.const 0
          i32.le_s
          br_if 1 (;@2;)
          i32.const 0
          local.set 11
          i32.const 0
          local.set 1
          local.get 5
          local.get 9
          i32.ge_s
          br_if 1 (;@2;)
          loop  ;; label = @4
            block  ;; label = @5
              local.get 1
              local.get 8
              i32.add
              local.get 2
              i32.rem_s
              i32.const 2
              i32.shl
              local.tee 2
              local.get 0
              i32.load offset=28
              i32.add
              i32.load offset=16
              local.tee 4
              i32.eqz
              br_if 0 (;@5;)
              local.get 0
              i32.load offset=32
              local.get 2
              i32.add
              i32.load offset=16
              local.tee 7
              local.get 4
              i32.load offset=12
              i32.ge_s
              br_if 0 (;@5;)
              local.get 4
              local.get 7
              local.get 3
              i32.const 3387160
              i32.load
              call 50458
              i32.const 1
              local.set 11
              local.get 12
              local.get 3
              i32.load
              i32.const 0
              i32.const 1
              local.get 0
              call 41042
              drop
              local.get 0
              i32.load offset=32
              local.get 2
              i32.add
              i32.const 16
              i32.add
              local.tee 2
              local.get 2
              i32.load
              i32.const 1
              i32.add
              i32.store
              local.get 5
              i32.const 1
              i32.add
              local.set 5
              local.get 0
              i32.load offset=24
              local.set 6
            end
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            local.get 6
            i32.load offset=12
            local.tee 2
            i32.lt_s
            local.get 5
            local.get 9
            i32.lt_s
            i32.and
            br_if 0 (;@4;)
          end
          local.get 11
          i32.eqz
          br_if 1 (;@2;)
          local.get 8
          i32.const 1
          i32.add
          local.get 2
          i32.rem_s
          local.set 8
          local.get 5
          local.get 9
          i32.lt_s
          br_if 0 (;@3;)
        end
      end
      local.get 0
      i32.const 1
      i32.store offset=8
      local.get 0
      local.get 0
      i32.load offset=36
      i32.store offset=12
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0
    local.get 10)
