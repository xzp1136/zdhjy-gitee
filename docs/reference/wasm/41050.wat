  (func (;41050;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4365147
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3388076
      call 2180
      i32.const 3388080
      call 2180
      i32.const 3388084
      call 2180
      i32.const 3480608
      call 2180
      i32.const 4365147
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=60
      local.tee 3
      i32.load offset=12
      i32.const 1
      i32.sub
      local.tee 4
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        block  ;; label = @3
          local.get 3
          local.get 4
          local.get 5
          i32.const 12
          i32.add
          i32.const 3388084
          i32.load
          call 50458
          block  ;; label = @4
            local.get 5
            i32.load offset=12
            local.tee 3
            i32.eqz
            br_if 0 (;@4;)
            local.get 3
            i32.load offset=12
            local.get 1
            i32.ne
            br_if 0 (;@4;)
            local.get 3
            i32.load offset=20
            local.get 2
            i32.ne
            br_if 0 (;@4;)
            local.get 3
            i32.load offset=28
            local.tee 3
            i32.eqz
            br_if 0 (;@4;)
            local.get 0
            local.get 3
            i32.const 0
            local.get 4
            call 41046
            i32.const 0
            i32.gt_s
            br_if 1 (;@3;)
            local.get 5
            local.get 1
            i32.store offset=8
            i32.const 3359088
            i32.load
            local.get 5
            i32.const 8
            i32.add
            call 2193
            local.set 4
            local.get 5
            local.get 2
            i32.store offset=4
            i32.const 3359088
            i32.load
            local.get 5
            i32.const 4
            i32.add
            call 2193
            local.set 3
            i32.const 3480608
            i32.load
            local.get 4
            local.get 3
            i32.const 0
            call 48227
            local.set 4
            i32.const 3356428
            i32.load
            local.tee 3
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 3
              call 60460
            end
            local.get 4
            i32.const 0
            call 55817
            br 3 (;@1;)
          end
          local.get 4
          i32.const 1
          i32.sub
          local.tee 4
          i32.const 0
          i32.lt_s
          br_if 2 (;@1;)
          local.get 0
          i32.load offset=60
          local.set 3
          br 1 (;@2;)
        end
      end
      local.get 0
      i32.load offset=60
      local.get 4
      i32.const 3388076
      i32.load
      call 50451
      i32.const 1
      local.set 6
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 6)
