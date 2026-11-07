  (func (;43387;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366713
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3400688
      call 2180
      i32.const 3411548
      call 2180
      i32.const 3359788
      call 2180
      i32.const 4366713
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=8
    local.get 0
    i32.load offset=20
    local.set 2
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block (result i32)  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 0
                  i32.load
                  if  ;; label = @8
                    i32.const 3359788
                    i32.load
                    local.tee 1
                    i32.load offset=116
                    if (result i32)  ;; label = @9
                      local.get 1
                    else
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      i32.const 730
                      local.get 1
                      call 23
                      i32.const 3822344
                      i32.load
                      local.set 1
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      local.get 1
                      i32.const 1
                      i32.eq
                      br_if 4 (;@5;)
                      i32.const 3359788
                      i32.load
                    end
                    i32.load offset=92
                    i32.load offset=4
                    local.set 5
                    i32.const 3822344
                    i32.const 0
                    i32.store
                    i32.const 734
                    i32.const 3354340
                    i32.load
                    call 9
                    local.set 3
                    i32.const 3822344
                    i32.load
                    local.set 1
                    i32.const 3822344
                    i32.const 0
                    i32.store
                    block  ;; label = @9
                      local.get 1
                      i32.const 1
                      i32.eq
                      br_if 0 (;@9;)
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      i32.const 2460
                      local.get 3
                      local.get 2
                      i32.const 3411548
                      i32.load
                      i32.const 0
                      call 72
                      i32.const 3822344
                      i32.load
                      local.set 1
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      local.get 1
                      i32.const 1
                      i32.eq
                      br_if 0 (;@9;)
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      i32.const 2663
                      local.get 5
                      local.get 3
                      i32.const 0
                      call 21
                      local.set 1
                      i32.const 3822344
                      i32.load
                      local.set 3
                      i32.const 3822344
                      i32.const 0
                      i32.store
                      block  ;; label = @10
                        local.get 3
                        i32.const 1
                        i32.eq
                        br_if 0 (;@10;)
                        local.get 1
                        i32.eqz
                        if  ;; label = @11
                          i32.const 3359788
                          i32.load
                          i32.load offset=92
                          local.get 1
                          i32.store offset=4
                          br 4 (;@7;)
                        end
                        i32.const 3354340
                        i32.load
                        local.tee 3
                        local.get 1
                        i32.load
                        i32.ne
                        if  ;; label = @11
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          i32.const 774
                          local.get 1
                          local.get 3
                          call 13
                          i32.const 3822344
                          i32.load
                          local.set 2
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 2
                          i32.const 1
                          i32.eq
                          br_if 1 (;@10;)
                          br 10 (;@1;)
                        end
                        i32.const 3359788
                        i32.load
                        i32.load offset=92
                        local.get 1
                        i32.store offset=4
                        local.get 1
                        i32.load
                        local.get 3
                        i32.eq
                        br_if 3 (;@7;)
                        i32.const 3822344
                        i32.const 0
                        i32.store
                        i32.const 774
                        local.get 1
                        local.get 3
                        call 13
                        i32.const 3822344
                        i32.load
                        local.set 2
                        i32.const 3822344
                        i32.const 0
                        i32.store
                        local.get 2
                        i32.const 1
                        i32.ne
                        br_if 9 (;@1;)
                      end
                      i32.const 2693560
                      call 10
                      br 5 (;@4;)
                    end
                    i32.const 2693560
                    call 10
                    br 4 (;@4;)
                  end
                  local.get 4
                  local.get 0
                  i32.load offset=24
                  i32.store offset=8
                  local.get 0
                  i32.const -1
                  i32.store
                  local.get 0
                  i32.const 0
                  i32.store offset=24 align=1
                  br 1 (;@6;)
                end
                local.get 2
                i32.load offset=32
                local.tee 1
                i32.load
                local.tee 3
                i32.load offset=572
                local.set 5
                local.get 3
                i32.load offset=568
                local.set 3
                i32.const 3822344
                i32.const 0
                i32.store
                local.get 3
                local.get 1
                f32.const 0x0p+0 (;=0;)
                local.get 5
                call 99
                i32.const 3822344
                i32.load
                local.set 1
                i32.const 3822344
                i32.const 0
                i32.store
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          local.get 1
                          i32.const 1
                          i32.eq
                          br_if 0 (;@11;)
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          i32.const 5007
                          i32.const 0
                          call 23
                          i32.const 3822344
                          i32.load
                          local.set 1
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 1
                          i32.const 1
                          i32.eq
                          br_if 0 (;@11;)
                          i32.const 4367466
                          i32.load8_u
                          i32.eqz
                          if  ;; label = @12
                            i32.const 3822344
                            i32.const 0
                            i32.store
                            i32.const 791
                            i32.const 3354384
                            call 23
                            i32.const 3822344
                            i32.load
                            local.set 1
                            i32.const 3822344
                            i32.const 0
                            i32.store
                            local.get 1
                            i32.const 1
                            i32.eq
                            br_if 2 (;@10;)
                            i32.const 4367466
                            i32.const 1
                            i32.store8
                          end
                          i32.const 3354384
                          i32.load
                          i32.load offset=92
                          i32.load
                          local.set 1
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          i32.const 5008
                          local.get 1
                          i32.const 0
                          call 17
                          local.set 3
                          i32.const 3822344
                          i32.load
                          local.set 1
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 1
                          i32.const 1
                          i32.eq
                          br_if 2 (;@9;)
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          i32.const 3822344
                          i32.load
                          local.set 1
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 1
                          i32.const 1
                          i32.eq
                          br_if 3 (;@8;)
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 4
                          local.get 3
                          i32.store offset=8
                          i32.const 2032
                          local.get 4
                          i32.const 8
                          i32.add
                          i32.const 0
                          call 17
                          local.set 3
                          i32.const 3822344
                          i32.load
                          local.set 1
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 1
                          i32.const 1
                          i32.eq
                          br_if 4 (;@7;)
                          local.get 3
                          br_if 5 (;@6;)
                          local.get 0
                          i32.const 0
                          i32.store
                          local.get 0
                          local.get 4
                          i32.load offset=8
                          i32.store offset=24
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          i32.const 1662
                          local.get 0
                          i32.const 4
                          i32.add
                          local.get 4
                          i32.const 8
                          i32.add
                          local.get 0
                          i32.const 3400688
                          i32.load
                          call 72
                          i32.const 3822344
                          i32.load
                          local.set 2
                          i32.const 3822344
                          i32.const 0
                          i32.store
                          local.get 2
                          i32.const 1
                          i32.ne
                          br_if 8 (;@3;)
                          i32.const 2693560
                          call 10
                          br 7 (;@4;)
                        end
                        i32.const 2693560
                        call 10
                        br 6 (;@4;)
                      end
                      i32.const 2693560
                      call 10
                      br 5 (;@4;)
                    end
                    i32.const 2693560
                    call 10
                    br 4 (;@4;)
                  end
                  i32.const 2693560
                  call 10
                  br 3 (;@4;)
                end
                i32.const 2693560
                call 10
                br 2 (;@4;)
              end
              i32.const 3822344
              i32.const 0
              i32.store
              i32.const 2033
              local.get 4
              i32.const 8
              i32.add
              i32.const 0
              call 13
              i32.const 3822344
              i32.load
              local.set 1
              i32.const 3822344
              i32.const 0
              i32.store
              local.get 1
              i32.const 1
              i32.eq
              br_if 0 (;@5;)
              i32.const 3822344
              i32.const 0
              i32.store
              i32.const 5009
              local.get 2
              i32.const 0
              call 13
              i32.const 3822344
              i32.load
              local.set 1
              i32.const 3822344
              i32.const 0
              i32.store
              local.get 1
              i32.const 1
              i32.ne
              if  ;; label = @6
                i32.const 3822344
                i32.const 0
                i32.store
                i32.const 5010
                local.get 2
                i32.const 0
                call 13
                i32.const 3822344
                i32.load
                local.set 2
                i32.const 3822344
                i32.const 0
                i32.store
                local.get 2
                i32.const 1
                i32.eq
                if  ;; label = @7
                  i32.const 2693560
                  call 10
                  br 3 (;@4;)
                end
                local.get 0
                i32.const -2
                i32.store
                local.get 0
                i32.const 4
                i32.add
                i32.const 0
                call 52078
                br 3 (;@3;)
              end
              i32.const 2693560
              call 10
              br 1 (;@4;)
            end
            i32.const 2693560
            call 10
          end
          local.set 2
          call 11
          i32.const 2693560
          call 91
          i32.eq
          if  ;; label = @4
            local.get 2
            call 14
            local.set 2
            i32.const 3822344
            i32.const 0
            i32.store
            i32.const 775
            i32.const 3357100
            call 9
            local.set 3
            i32.const 3822344
            i32.load
            local.set 1
            i32.const 3822344
            i32.const 0
            i32.store
            block  ;; label = @5
              local.get 1
              i32.const 1
              i32.eq
              br_if 0 (;@5;)
              local.get 2
              i32.load
              i32.load
              local.set 1
              i32.const 3822344
              i32.const 0
              i32.store
              i32.const 776
              local.get 3
              local.get 1
              call 17
              local.set 3
              i32.const 3822344
              i32.load
              local.set 1
              i32.const 3822344
              i32.const 0
              i32.store
              local.get 1
              i32.const 1
              i32.eq
              br_if 0 (;@5;)
              local.get 3
              if  ;; label = @6
                local.get 2
                i32.load
                local.set 2
                call 15
                local.get 0
                i32.const -2
                i32.store
                local.get 0
                i32.const 4
                i32.add
                local.get 2
                i32.const 0
                call 52083
                br 3 (;@3;)
              end
              i32.const 4
              call 16
              local.tee 0
              local.get 2
              i32.load
              i32.store
              i32.const 3822344
              i32.const 0
              i32.store
              i32.const 777
              local.get 0
              i32.const 2693560
              i32.const 0
              call 24
              i32.const 3822344
              i32.load
              local.set 0
              i32.const 3822344
              i32.const 0
              i32.store
              local.get 0
              i32.const 1
              i32.ne
              br_if 4 (;@1;)
            end
            call 19
            local.set 2
            call 11
            drop
            i32.const 3822344
            i32.const 0
            i32.store
            i32.const 59
            call 12
            i32.const 3822344
            i32.load
            local.set 0
            i32.const 3822344
            i32.const 0
            i32.store
            local.get 0
            i32.const 1
            i32.eq
            br_if 2 (;@2;)
          end
          local.get 2
          call 20
          unreachable
        end
        local.get 4
        i32.const 16
        i32.add
        global.set 0
        return
      end
      i32.const 0
      call 10
      drop
      call 11
      drop
      call 996
      unreachable
    end
    unreachable)
