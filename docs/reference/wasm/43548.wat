  (func (;43548;) (type 12) (param i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 8
    global.set 0
    i32.const 4366822
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388632
      call 2180
      i32.const 3388636
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366822
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store
    local.get 3
    i32.const 0
    i32.store
    local.get 4
    i32.const -1
    i32.store
    block  ;; label = @1
      local.get 0
      i32.load offset=32
      local.tee 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      block  ;; label = @2
        block  ;; label = @3
          loop  ;; label = @4
            local.get 5
            local.get 7
            local.get 8
            i32.const 8
            i32.add
            i32.const 3388636
            i32.load
            call 50458
            local.get 8
            i32.load offset=8
            local.set 5
            i32.const 3360788
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            block  ;; label = @5
              local.get 5
              i32.const 0
              i32.const 0
              call 48872
              br_if 0 (;@5;)
              local.get 5
              i32.load8_u offset=84
              i32.eqz
              br_if 0 (;@5;)
              local.get 5
              i32.load offset=64
              local.get 1
              i32.ne
              br_if 0 (;@5;)
              local.get 5
              i32.load offset=60
              local.get 5
              i32.load offset=72
              local.tee 9
              local.get 5
              i32.load offset=68
              local.tee 6
              i32.add
              i32.le_s
              br_if 0 (;@5;)
              local.get 6
              i32.const 0
              i32.le_s
              local.get 9
              i32.const 0
              i32.le_s
              i32.and
              br_if 0 (;@5;)
              local.get 3
              i32.const 0
              i32.store
              local.get 4
              i32.const -1
              i32.store
              local.get 5
              i32.load8_u offset=85
              local.tee 9
              i32.eqz
              local.get 5
              i32.load offset=64
              local.tee 6
              i32.const 0
              i32.ne
              i32.or
              i32.eqz
              br_if 0 (;@5;)
              local.get 6
              i32.eqz
              local.get 1
              local.get 6
              i32.eq
              i32.or
              i32.eqz
              br_if 0 (;@5;)
              local.get 5
              i32.load offset=60
              local.get 5
              i32.load offset=72
              local.tee 10
              local.get 5
              i32.load offset=68
              i32.add
              i32.le_s
              br_if 0 (;@5;)
              local.get 9
              br_if 2 (;@3;)
              local.get 6
              i32.eqz
              if  ;; label = @6
                local.get 5
                i32.load8_u offset=52
                br_if 1 (;@5;)
              end
              local.get 5
              local.get 1
              i32.store offset=64
              local.get 5
              i32.const 1
              i32.store8 offset=52
              local.get 5
              local.get 10
              i32.const 1
              i32.add
              i32.store offset=72
              br 3 (;@2;)
            end
            local.get 7
            i32.const 1
            i32.add
            local.tee 7
            local.get 0
            i32.load offset=32
            local.tee 5
            i32.load offset=12
            local.tee 6
            i32.lt_s
            br_if 0 (;@4;)
          end
          local.get 6
          i32.const 0
          i32.le_s
          if  ;; label = @4
            i32.const 0
            local.set 7
            br 3 (;@1;)
          end
          i32.const 0
          local.set 7
          loop  ;; label = @4
            local.get 5
            local.get 7
            local.get 8
            i32.const 12
            i32.add
            i32.const 3388636
            i32.load
            call 50458
            local.get 8
            i32.load offset=12
            local.set 5
            i32.const 3360788
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            block  ;; label = @5
              local.get 5
              i32.const 0
              i32.const 0
              call 48872
              br_if 0 (;@5;)
              local.get 5
              i32.load8_u offset=84
              i32.eqz
              br_if 0 (;@5;)
              local.get 5
              i32.load8_u offset=85
              br_if 0 (;@5;)
              local.get 5
              i32.load8_u offset=52
              br_if 0 (;@5;)
              local.get 3
              i32.const 0
              i32.store
              local.get 4
              i32.const -1
              i32.store
              local.get 5
              i32.load offset=64
              local.tee 6
              i32.const 0
              local.get 1
              local.get 6
              i32.ne
              select
              br_if 0 (;@5;)
              local.get 5
              i32.load offset=60
              local.get 5
              i32.load offset=72
              local.tee 6
              local.get 5
              i32.load offset=68
              i32.add
              i32.le_s
              br_if 0 (;@5;)
              local.get 5
              local.get 1
              i32.store offset=64
              local.get 5
              i32.const 1
              i32.store8 offset=52
              local.get 5
              local.get 6
              i32.const 1
              i32.add
              i32.store offset=72
              br 3 (;@2;)
            end
            local.get 7
            i32.const 1
            i32.add
            local.tee 7
            local.get 0
            i32.load offset=32
            local.tee 5
            i32.load offset=12
            i32.lt_s
            br_if 0 (;@4;)
          end
          i32.const 0
          local.set 7
          br 2 (;@1;)
        end
        local.get 5
        local.get 1
        i32.store offset=64
        local.get 5
        local.get 10
        i32.const 1
        i32.add
        i32.store offset=72
      end
      local.get 3
      local.get 5
      i32.const 0
      call 48735
      i32.store
      local.get 4
      local.get 5
      i32.load offset=48
      i32.store
      local.get 2
      local.get 5
      i32.store
      i32.const 1
      local.set 7
    end
    local.get 8
    i32.const 16
    i32.add
    global.set 0
    local.get 7)
